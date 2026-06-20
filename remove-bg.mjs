import fs from "node:fs";

async function removeBg(blob) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", blob);

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": "K5X6PDJaw2rqk9Vo3CQgXd5K" },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

const inputPath = "./rocket_white.png";
console.log(`🚀 Removing background from: ${inputPath}`);

const fileBlob = await fs.openAsBlob(inputPath);
const rbgResultData = await removeBg(fileBlob);
fs.writeFileSync("rocket_nobg.png", Buffer.from(rbgResultData));

console.log("✅ Done! Saved as rocket_nobg.png");
