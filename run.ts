const generateCommand = (folder: string) =>
    `deno bundle ./${folder}/index.ts --watch --import-map ./import_map.json --config ./deno.tsconfig.json ./${folder}/index.bundle.js`.split(
        " "
    );

await Deno.run({
    cmd: generateCommand(Deno.args[0] || "1_introduction"),
}).status();
