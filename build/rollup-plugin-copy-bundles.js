import { constants, access, copyFile } from 'fs';
import { basename, join } from 'path';

export default function copyBundleFiles(targetDir) {
    return {
        name: 'rollup-plugin-copy-bundles', // this name will show up in warnings and errors
        writeBundle(options, bundle) {
            const compiledFilePath = options.file;
            access(compiledFilePath, constants.F_OK, err => {
                // check if file exists
                if (!err) {
                    // copy js file to docs dir
                    copyFile(compiledFilePath, join(targetDir, basename(compiledFilePath)), () => {});

                    if (options.sourcemap) {
                        // copy map file to docs dir
                        copyFile(compiledFilePath + '.map', join(targetDir, basename(compiledFilePath) + '.map'), () => {});
                    }
                }
                else {
                    console.error("Bundle file not found");
                }
            })
        }
    };
}