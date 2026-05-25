import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"] as (
  | "places"
  | "drawing"
  | "geometry"
  | "visualization"
)[];

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type Item = { productId: number; quantity: number };

export default function Checkout() {
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
  const [items, setItems] = useState<Item[]>([{ productId: 1, quantity: 1 }]);

  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const autoCompleteObj = useRef<any>(null);

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
        if (results && results[0]) setAddress(results[0].formatted_address);
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
          if (results && results[0]) setAddress(results[0].formatted_address);
        });
      }
    },
    [isLoaded],
  );

  const updateItem = (index: number, key: keyof Item, value: number) => {
    setItems((s) =>
      s.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    );
  };

  const addItem = () => setItems((s) => [...s, { productId: 1, quantity: 1 }]);

  const submit = async () => {
    if (!customer || !phone || !address || items.length === 0)
      return alert("Fill required fields");

    const payload: any = {
      customer,
      phone,
      address,
      items,
    };
    if (latLng) {
      payload.latitude = latLng.lat;
      payload.longitude = latLng.lng;
    }

    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000") +
        "/api/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (res.ok) {
      alert("Order placed");
      setCustomer("");
      setPhone("");
      setAddress("");
      setLatLng(null);
      setItems([{ productId: 1, quantity: 1 }]);
    } else {
      const err = await res.json();
      alert(err.message || "Failed");
    }
  };

  if (loadError) return <div>Map load error</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Checkout</h2>
      <div>
        <label>Name</label>
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} />
      </div>
      <div>
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label>Address (autocomplete)</label>
        <input
          ref={autocompleteRef}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button onClick={useCurrentLocation}>Use current location</button>
      </div>

      <div style={{ height: 400, marginTop: 12 }}>
        {/* simple map using google maps JS via window object to avoid adding additional wrappers */}
        <div id="map" style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Items</h4>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              type="number"
              value={it.productId}
              onChange={(e) =>
                updateItem(idx, "productId", Number(e.target.value))
              }
            />
            <input
              type="number"
              value={it.quantity}
              onChange={(e) =>
                updateItem(idx, "quantity", Number(e.target.value))
              }
            />
          </div>
        ))}
        <button onClick={addItem}>Add item</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>Place order</button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function initMap(){
          if(!window.google) return;
          const map = new google.maps.Map(document.getElementById('map'), { center: { lat: 0, lng: 0 }, zoom: 2 });
          let marker = null;
          map.addListener('click', function(e){
            const lat = e.latLng.lat(); const lng = e.latLng.lng();
            if(marker) marker.setPosition(e.latLng); else marker = new google.maps.Marker({ position: e.latLng, map });
            // communicate to React by dispatching custom event
            window.dispatchEvent(new CustomEvent('map-click', { detail: { lat, lng } }));
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
