import express from "express";
import dotenv from "dotenv";
import routes from "./router/v1/routes.js";
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ msg: "Hello from Request..." });
});
app.use("/api/v1", routes);

app.listen(PORT, HOST, () => {
  console.log(`app is listen on port ${PORT}`);
});
