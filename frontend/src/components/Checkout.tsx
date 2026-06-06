import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoadScript } from "@react-google-maps/api";
import { getApiBaseUrl } from "@/lib/api";
import { useApp } from "@/contexts/AppContext";
import { useCart } from "@/hooks/useCart";

const libraries = ["places"] as (
  | "places"
  | "drawing"
  | "geometry"
  | "visualization"
)[];

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type Item = { productId: number; quantity: number };

export default function Checkout() {
  const router = useRouter();
  const { state } = useApp();

  // Enforce login before accessing checkout
  useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      router.replace("/login");
    }
  }, [state.loading, state.isAuthenticated, router]);

  // Show loading state while checking authentication
  if (state.loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render checkout if not authenticated
  if (!state.isAuthenticated) {
    return null;
  }

  return <CheckoutForm />;
}

function CheckoutForm() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: String(apiKey),
    libraries,
  });

  const [address, setAddress] = useState("");
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const autoCompleteObj = useRef<any>(null);

  const { items: cartItems, clearCart } = useCart();

  useEffect(() => {
    if (!isLoaded || !window.google || !autocompleteRef.current) return;
    autoCompleteObj.current = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        fields: ["formatted_address", "geometry"],
      },
    );
    autoCompleteObj.current.addListener("place_changed", () => {
      const place = autoCompleteObj.current.getPlace();
      if (place.formatted_address) setAddress(place.formatted_address);
      if (place.geometry?.location) {
        setLatLng({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  }, [isLoaded]);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatLng({ lat, lng });
      if (isLoaded && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        const results = await geocoder.geocode({ location: { lat, lng } });
        const first = (results as any)?.[0];
        if (first?.formatted_address) setAddress(first.formatted_address);
      }
    });
  }, [isLoaded]);

  const onMapClick = useCallback(
    (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatLng({ lat, lng });
      if (isLoaded && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any) => {
          const first = (results as any)?.[0];
          if (first?.formatted_address) setAddress(first.formatted_address);
        });
      }
    },
    [isLoaded],
  );

  const orderItems = cartItems.map((item) => ({
    productId: Number(item.id),
    quantity: item.quantity,
  }));

  const submit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      const payload = {
        customer,
        phone,
        address,
        items: cartItems.map((it) => ({
          productId: Number(it.id),
          quantity: it.quantity,
        })),
        ...(latLng && {
          latitude: latLng.lat,
          longitude: latLng.lng,
        }),
      };

      const res = await fetch(`${getApiBaseUrl()}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Order failed");
      }

      alert("Order placed successfully");

      await clearCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) return <div>Map load error</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Checkout</h2>

      {/* CUSTOMER INFO */}
      <section style={{ marginBottom: 16 }}>
        <h4>Customer Details</h4>

        <div>
          <label>Name</label>
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>

        <div>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </section>

      {/* ADDRESS */}
      <section style={{ marginBottom: 16 }}>
        <h4>Delivery Address</h4>

        <input
          ref={autocompleteRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter delivery address"
          style={{ width: "100%" }}
        />

        <button onClick={useCurrentLocation} style={{ marginTop: 8 }}>
          Use current location
        </button>
      </section>

      {/* MAP */}
      <section style={{ marginBottom: 16 }}>
        <h4>Select Location</h4>

        <div style={{ height: 350, width: "100%" }}>
          <div id="map" style={{ width: "100%", height: "100%" }} />
        </div>
      </section>

      {/* CART SUMMARY */}
      <section style={{ marginBottom: 16 }}>
        <h4>Order Summary</h4>

        {cartItems?.length === 0 ? (
          <p style={{ color: "red" }}>Your cart is empty</p>
        ) : (
          <>
            {cartItems.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                }}
              >
                <span>{it.name}</span>
                <span>x {it.quantity}</span>
              </div>
            ))}

            <hr />

            <div style={{ fontWeight: "bold" }}>
              Total Items:{" "}
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </div>
          </>
        )}
      </section>

      {/* SUBMIT */}
      <button
        onClick={submit}
        disabled={
          isSubmitting ||
          cartItems.length === 0 ||
          !customer ||
          !phone ||
          !address
        }
        style={{
          width: "100%",
          padding: 12,
          background: isSubmitting ? "#ccc" : "#000",
          color: "#fff",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Placing order..." : "Place Order"}
      </button>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function initMap(){
            if(!window.google) return;

            const map = new google.maps.Map(
              document.getElementById('map'),
              {
                center: { lat: 0, lng: 0 },
                zoom: 2
              }
            );

            let marker = null;

            map.addListener('click', function(e){
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();

              if(marker) {
                marker.setPosition(e.latLng);
              } else {
                marker = new google.maps.Marker({
                  position: e.latLng,
                  map
                });
              }

              window.dispatchEvent(
                new CustomEvent('map-click', {
                  detail: { lat, lng }
                })
              );
            });

            window.__grocery_map = map;
          })();
        `,
        }}
      />

      <MapEventsBridge setLatLng={setLatLng} />
    </div>
  );
}

function MapEventsBridge({
  setLatLng,
}: {
  setLatLng: (v: { lat: number; lng: number } | null) => void;
}) {
  useEffect(() => {
    const handler = (e: any) => {
      const { lat, lng } = e.detail;
      setLatLng({ lat, lng });
      // reverse geocode to set address if possible
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any) => {
          if (results && results[0]) {
            // find the autocomplete input and set value
            const input: HTMLInputElement | null = document.querySelector(
              "#root input[ref]",
            ) as any;
          }
        });
      }
    };
    window.addEventListener("map-click", handler as EventListener);
    return () =>
      window.removeEventListener("map-click", handler as EventListener);
  }, [setLatLng]);
  return null;
}
