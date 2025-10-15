//code gi thi tu import vao
import express, { json } from "express";
import * as dotenv from "dotenv";
import connectDB from "./config/database.js";
import cors from "cors";
connectDB();
const app = express();  
app.use(cors());

app.use(express.json());
const port = process.env.PORT || 9999;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}   );