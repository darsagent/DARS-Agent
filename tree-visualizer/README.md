This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the page like this.



## Configuration(.env file)
The app relies on a `.env` file where you can configure the paths for key input files:

```
ROOT_INPUT_FILE: The main .root file that needs to be visualized.
 
JSON_EVAL_FILE: The final evaluation file generated after running the model, representing the end nodes and whether a node is an accepted or rejected solution 
 
ROOT_INPUT_FOLDER: Contains all 16 possible .root files, each representing different trajectory cases: ["Append", "Create", "Edit", "Submit"].
```



