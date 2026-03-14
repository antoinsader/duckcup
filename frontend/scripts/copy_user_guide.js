const fs = require("fs");
const path = require("path");

const root_dir = path.resolve(__dirname, "..");
const source_file = path.join(root_dir, "user_guide.md");
const public_dir = path.join(root_dir, "public");
const target_file = path.join(public_dir, "user_guide.md");

const run_copy = () => {
  if (!fs.existsSync(source_file)) {
    console.error("[copy_user_guide] source file not found", source_file);
    process.exit(1);
  }

  if (!fs.existsSync(public_dir)) {
    fs.mkdirSync(public_dir, { recursive: true });
  }

  fs.copyFileSync(source_file, target_file);
  console.log("[copy_user_guide] copied", {
    from: source_file,
    to: target_file,
  });
};

run_copy();
