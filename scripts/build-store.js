// Builds a Chrome Web Store-ready package from the production build.
//
// Usage: WEB_CLIENT_ID=<production-client-id> npm run build:store
//
// The store assigns its own extension ID, so the manifest `key` (which pins a
// stable ID for local development) is stripped from the packaged manifest.
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const prodConfig = require("../webpack.prod.js");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const out = path.join(root, "dist-store");

const compiler = webpack(prodConfig);
compiler.run((err, stats) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    if (stats.hasErrors()) {
        console.error(stats.toString({ colors: true }));
        process.exit(1);
    }
    console.log(
        stats.toString({ colors: true, chunks: false, modules: false }),
    );

    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });

    for (const dir of ["js", "icon"]) {
        fs.cpSync(path.join(dist, dir), path.join(out, dir), {
            recursive: true,
        });
    }
    fs.copyFileSync(
        path.join(dist, "popup.html"),
        path.join(out, "popup.html"),
    );

    const manifest = JSON.parse(
        fs.readFileSync(path.join(dist, "manifest.json"), "utf8"),
    );
    delete manifest.key;
    fs.writeFileSync(
        path.join(out, "manifest.json"),
        JSON.stringify(manifest, null, 4) + "\n",
    );

    console.log(
        "Store package ready in dist-store/ — zip its contents to upload.",
    );
});
