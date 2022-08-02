import { downloadNpmPackage } from "https://deno.land/x/npm_fetcher@v0.0.1/mod.ts";
import * as path from "https://deno.land/std@0.150.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.150.0/fs/mod.ts";

export interface DownloadNpmPackagesOptions {
	/**
	 * A list of packages to download.
	 * Packages should be in the format "[package-name]@[version]".
	 */
	packages: string[];
	/**
	 * The path to the directory where the packages will be placed.
	 * This defaults to ${cwd}/npm_packages/
	 */
	outputDir?: string;
}

export async function downloadNpmPackages({
	packages,
	outputDir = path.resolve(Deno.cwd(), "./npm_packages/"),
}: DownloadNpmPackagesOptions) {
	await fs.ensureDir(outputDir);

	for (const packageStr of packages) {
		const splitPackage = packageStr.split("@");
		if (splitPackage.length !== 2) {
			throw new Error(`Invalid package format: ${packageStr}`);
		}
		const [packageName, version] = splitPackage;
		const packagePath = path.resolve(outputDir, packageName, version);

		// Check if the package already exists and skip it if it does
		let exists = false;
		try {
			const result = await Deno.stat(packagePath);
			if (result.isDirectory) {
				exists = true;
			}
		} catch (e) {
			if (!(e instanceof Deno.errors.NotFound)) {
				throw e;
			}
		}
		if (exists) continue;

		// Download the package
		console.log(`Downloading ${packageStr}`);
		await downloadNpmPackage({
			packageName,
			version,
			destination: packagePath,
		});
	}
}
