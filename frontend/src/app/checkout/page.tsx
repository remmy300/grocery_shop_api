"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";

import { useRouter } from "next/navigation";
import {
  Lock,
  Truck,
  Store,
  Navigation,
  Banknote,
  Smartphone,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/components/checkout/checkoutContext";
import { useSettings } from "@/contexts/SettingsContext";
import MpesaPaymentProcessor from "@/components/checkout/MpesaPaymentProcessor";

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const {
    state,
    setDelivery,
    setPayment,
    setAddress,
    setLocation,
    subtotal,
    shipping,
    taxes,
    total,
    availablePaymentMethods,
    belowMinOrder,
    canCheckout,
  } = useCheckout();

  const { settings } = useSettings();
  const currency = settings.defaultCurrency || "KES";

  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  /*  LOCATION HANDLER  */

  const handleUseCurrentLocation = async () => {
    console.log("Use current location clicked");

    if (!("geolocation" in navigator)) {
      const message = "Geolocation is not supported by your browser.";
      console.error(message);
      setGeoStatus(message);
      return;
    }

    if ("permissions" in navigator) {
      try {
        const status = await (navigator as any).permissions.query({
          name: "geolocation",
        });
        if (status.state === "denied") {
          const message =
            "Location access is denied. Please enable location permissions in your browser.";
          console.error(message);
          setGeoStatus(message);
          return;
        }
      } catch (error) {
        console.warn("Geolocation permission check failed", error);
      }
    }

    setGeoStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Geolocation success", pos);
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus("Location found.");
      },
      (err) => {
        console.error("Location error:", err);
        const message =
          err.code === 1
            ? "Location permission denied."
            : err.code === 2
              ? "Position unavailable."
              : err.code === 3
                ? "Location request timed out."
                : "Unable to get your location.";
        setGeoStatus(message);
        alert(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  /*  GOOGLE MAPS + PLACES */
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);

  const loadGoogleMaps = useCallback(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setGeoStatus("Google Maps API key is missing.");
      return;
    }

    if ((window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }

    if (document.getElementById("google-maps-script")) return;

    const s = document.createElement("script");
    s.id = "google-maps-script";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      // Verify Maps actually initialised — RefererNotAllowedMapError still fires onload
      if ((window as any).google?.maps) {
        setMapsLoaded(true);
        setGeoStatus(null);
      } else {
        setGeoStatus(
          "Google Maps failed to initialise. Check your API key referrer settings.",
        );
      }
    };
    s.onerror = () => {
      setGeoStatus(
        "Failed to load Google Maps. Check your internet connection.",
      );
    };
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  useEffect(() => {
    if (!mapRef.current || !mapsLoaded) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    const initialCenter = state.location ?? { lat: -1.286389, lng: 36.817223 }; // Nairobi fallback
    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: state.location ? 15 : 6,
    });

    if (state.location) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new google.maps.Marker({
        position: state.location,
        map,
      });
    }

    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocation({ lat, lng });
      if (markerRef.current) markerRef.current.setPosition(e.latLng);
      else
        markerRef.current = new google.maps.Marker({ position: e.latLng, map });

      // reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any) => {
        if (results && results[0]) {
          const formatted = results[0].formatted_address;
          setAddress({
            ...state.address!,
            street: formatted,
          });
        }
      });
    });

    // Attach autocomplete to the street input
    const input = document.getElementById(
      "street-input",
    ) as HTMLInputElement | null;
    if (input) {
      const ac = new google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "geometry"],
        componentRestrictions: { country: "ke" },
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.formatted_address) {
          setAddress({ ...state.address!, street: place.formatted_address });
        }
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setLocation({ lat, lng });
          map.setCenter({ lat, lng });
          map.setZoom(15);
          if (markerRef.current)
            markerRef.current.setPosition(place.geometry.location);
          else
            markerRef.current = new google.maps.Marker({
              position: place.geometry.location,
              map,
            });
        }
      });
    }
  }, [state.location, state.address]);

  /*  CHECKOUT MUTATION  */

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const base = getApiBaseUrl();
      const token = getAccessToken();
      const addressString = `${state.address?.street ?? ""}${state.address?.city ? ", " + state.address?.city : ""}${state.address?.postalCode ? " " + state.address?.postalCode : ""}`;

      if (!token) {
        throw new Error("Please sign in before placing your order");
      }

      const res = await fetch(`${base}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: Number(i.id),
            quantity: i.quantity,
          })),
          customer: state.address?.fullName,
          phone: state.address?.phone,
          address: addressString,
          street: state.address?.street,
          city: state.address?.city,
          postalCode: state.address?.postalCode,
          latitude: state.location?.lat,
          longitude: state.location?.lng,
          deliveryMethod: state.deliveryMethod ?? "standard",
          paymentMethod: state.paymentMethod ?? "mpesa",
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();
      setCreatedOrderId(order.id);
      return order;
    },
    onSuccess: async (order) => {
      // Cash on delivery — order is confirmed without payment processing
      if (state.paymentMethod === "cod") {
        await clearCart();
        sessionStorage.removeItem("checkout_state");
        router.push(
          `/order-success?orderId=${order.id}&amount=${total.toFixed(2)}&payment=cod`,
        );
      }
    },
    onError: (error) => {
      setPaymentError(error.message || "Failed to create order");
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 pb-20 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div>
            <h1 className="text-4xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Complete your grocery order
            </p>
          </div>

          {/* ADDRESS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold">Delivery Details</h2>

            <Card>
              <CardContent className="p-6 grid gap-4">
                <Input
                  placeholder="Full Name"
                  onChange={(e) =>
                    setAddress({
                      ...state.address!,
                      fullName: e.target.value,
                    })
                  }
                />

                <Input
                  id="street-input"
                  placeholder="Street Address"
                  value={state.address?.street ?? ""}
                  onChange={(e) =>
                    setAddress({ ...state.address!, street: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    onChange={(e) =>
                      setAddress({
                        ...state.address!,
                        city: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Postal Code"
                    onChange={(e) =>
                      setAddress({
                        ...state.address!,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  placeholder="Phone Number"
                  onChange={(e) =>
                    setAddress({
                      ...state.address!,
                      phone: e.target.value,
                    })
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  className="gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Use Current Location
                </Button>
                {geoStatus ? (
                  <p className="text-sm text-muted-foreground">{geoStatus}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="h-72" ref={mapRef} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-2">
                <p className="text-sm text-muted-foreground">
                  Selected location
                </p>
                <p className="text-sm">
                  Lat: {state.location?.lat?.toFixed(6) ?? "N/A"} <br />
                  Lng: {state.location?.lng?.toFixed(6) ?? "N/A"}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* DELIVERY */}
          <section>
            <h2 className="text-xl font-bold mb-4">Delivery Method</h2>

            <RadioGroup
              value={state.deliveryMethod ?? "standard"}
              onValueChange={(v) => setDelivery(v as any)}
              className="grid md:grid-cols-2 gap-4"
            >
              <label className="cursor-pointer">
                <RadioGroupItem value="standard" className="sr-only" />
                <Card
                  className={`p-4 border-2 transition-colors ${state.deliveryMethod === "standard" ? "border-primary" : "border-border"}`}
                >
                  <Truck className="h-5 w-5 mb-2" />
                  <p className="font-bold">Home Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    We bring it to your door
                  </p>
                  {shipping > 0 ? (
                    <p className="text-sm font-semibold text-primary mt-1">
                      {currency} {shipping.toFixed(0)} delivery fee
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      Free delivery
                    </p>
                  )}
                  {settings.freeDeliveryThreshold > 0 &&
                    subtotal < settings.freeDeliveryThreshold &&
                    state.deliveryMethod === "standard" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Free delivery on orders over {currency}{" "}
                        {settings.freeDeliveryThreshold.toFixed(0)}
                      </p>
                    )}
                </Card>
              </label>

              <label className="cursor-pointer">
                <RadioGroupItem value="express" className="sr-only" />
                <Card
                  className={`p-4 border-2 transition-colors ${state.deliveryMethod === "express" ? "border-primary" : "border-border"}`}
                >
                  <Store className="h-5 w-5 mb-2" />
                  <p className="font-bold">Self Pickup</p>
                  <p className="text-sm text-muted-foreground">
                    Collect from our store
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    No delivery fee
                  </p>
                </Card>
              </label>
            </RadioGroup>
          </section>

          {/* PAYMENT */}
          <section>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <RadioGroup
              value={state.paymentMethod ?? "mpesa"}
              onValueChange={(v) => setPayment(v as any)}
              className="grid md:grid-cols-2 gap-4"
            >
              {availablePaymentMethods.includes("mpesa") && (
                <label className="cursor-pointer">
                  <RadioGroupItem value="mpesa" className="sr-only" />
                  <Card
                    className={`p-4 border-2 transition-colors ${state.paymentMethod === "mpesa" ? "border-primary" : "border-border"}`}
                  >
                    <Smartphone className="h-5 w-5 mb-2 text-green-600" />
                    <p className="font-bold">M-Pesa</p>
                    <p className="text-sm text-muted-foreground">
                      Pay via M-Pesa STK push
                    </p>
                  </Card>
                </label>
              )}

              {availablePaymentMethods.includes("cod") && (
                <label className="cursor-pointer">
                  <RadioGroupItem value="cod" className="sr-only" />
                  <Card
                    className={`p-4 border-2 transition-colors ${state.paymentMethod === "cod" ? "border-primary" : "border-border"}`}
                  >
                    <Banknote className="h-5 w-5 mb-2 text-amber-600" />
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Pay when your order arrives
                    </p>
                  </Card>
                </label>
              )}

              {availablePaymentMethods.length === 0 && (
                <p className="text-sm text-red-600 md:col-span-2">
                  No payment methods are currently available. Please try again
                  later.
                </p>
              )}
            </RadioGroup>
          </section>

          {/* M-PESA PAYMENT PROCESSOR */}
          {createdOrderId && state.paymentMethod === "mpesa" && (
            <section>
              <h2 className="text-xl font-bold mb-4">
                Complete M-Pesa Payment
              </h2>
              <MpesaPaymentProcessor
                orderId={createdOrderId}
                amount={total}
                phoneNumber={state.address?.phone || ""}
                customerName={state.address?.fullName || ""}
                onSuccess={async (receipt) => {
                  await clearCart();
                  sessionStorage.removeItem("checkout_state");
                  router.push(
                    `/order-success?orderId=${createdOrderId}&receipt=${encodeURIComponent(receipt)}&amount=${total.toFixed(2)}`,
                  );
                }}
                onError={(error) => {
                  setPaymentError(error);
                }}
              />
            </section>
          )}

          {/* ERROR MESSAGES */}
          {paymentError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-xs text-red-700">{paymentError}</p>
              </CardContent>
            </Card>
          )}

          {/* PAY BUTTON */}
          {!createdOrderId && (
            <>
              {belowMinOrder && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-amber-900">
                      Minimum order is {currency}{" "}
                      {settings.minOrderAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-700">
                      Add more items to reach the minimum before checking out.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button
                disabled={!canCheckout || checkoutMutation.isPending}
                onClick={() => checkoutMutation.mutate()}
                className="w-full h-14 text-lg font-bold"
              >
                {checkoutMutation.isPending
                  ? "Processing..."
                  : `Create Order • ${currency} ${total.toFixed(2)}`}
              </Button>
            </>
          )}

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Secure checkout
          </p>
        </div>

        {/* RIGHT SIDE */}
        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold">Order Summary</h3>

              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-bold">
                    {currency} {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <hr />

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {state.deliveryMethod === "express"
                      ? "Self Pickup"
                      : "Delivery"}
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `${currency} ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes (VAT)</span>
                  <span>
                    {currency} {taxes.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {currency} {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
