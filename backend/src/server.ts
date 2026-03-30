import express from "express";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
