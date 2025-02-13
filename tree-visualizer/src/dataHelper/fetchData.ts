import { promises as fs } from "fs";
import { config } from "dotenv";
import path from "path";

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

export async function fetchData(combination: string): Promise<StringAnyMap> {
  try {
    //path from env file
    const evalFilePath = process.env.JSON_EVAL_FILE;
    if (!evalFilePath) throw new Error("JSON_EVAL_FILE is not defined in .env");
    const inputFolderPath = process.env.ROOT_INPUT_FOLDER;
    if (!inputFolderPath)
      throw new Error("ROOT_INPUT_FOLDER is not defined in .env");

    const filePath = path.join(
      inputFolderPath,
      `/${combination.length ? combination : "none"}.prev.root`
    );

    const inputData = await readFile(filePath);
    const evalResults = await readFile(evalFilePath);

    return { inputData, evalResults }; // Return the parsed JSON object
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    throw new Error("Failed to read JSON from .root file");
  }
}
