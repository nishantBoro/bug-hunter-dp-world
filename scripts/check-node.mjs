const major = Number.parseInt(process.versions.node.split(".")[0], 10);

if (major < 18) {
  console.error(
    `Bug Hunter requires Node.js 18 or higher (current: ${process.versions.node}).`,
  );
  console.error("Upgrade Node, or run `nvm use` if you have an .nvmrc in this repo.");
  process.exit(1);
}
