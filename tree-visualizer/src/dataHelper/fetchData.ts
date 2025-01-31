import { promises as fs } from "fs";
import { config } from "dotenv";

//types
import { StringAnyMap } from "@/components/types";

//init env
config();

export async function readFile(
  filePath: string
): Promise<Record<string, StringAnyMap>> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading JSON file at ${filePath}:`, error);
    throw error;
  }
}

export async function fetchData(): Promise<StringAnyMap> {
  try {
    //path from env file
    const inputFilePath = process.env.ROOT_INPUT_FILE;
    if (!inputFilePath)
      throw new Error("ROOT_INPUT_FILE is not defined in .env");
    const evalFilePath = process.env.JSON_EVAL_FILE;
    if (!evalFilePath) throw new Error("JSON_EVAL_FILE is not defined in .env");

    const inputData = await readFile(inputFilePath);
    const evalResults = await readFile(evalFilePath);

    return { inputData, evalResults }; // Return the parsed JSON object
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    throw new Error("Failed to read JSON from .root file");
  }
}
