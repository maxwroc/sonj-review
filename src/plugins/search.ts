
export const search: SonjReview.ISearchPluginInitializer = (data, options?: SonjReview.ISearchOptions) => {

    let rootNode: SonjReview.IJsonViewer | null = null;

    let pathsToShow: string[][] | null = null;

    return {
        nodeInit: context => {
            if (rootNode == null) {
                // the first one is the root one
                rootNode = context.node;
            }
        },
        afterRender: context => {
            pathsToShow && context.node.toggleExpand(true);
        },
        beforeRenderProperties: (context, props) => {
            if (!pathsToShow) {
                return props;
            }

            return props
                .filter(p => pathsToShow!.some(pathToShow => isSubpath(pathToShow, context.node.path) && isSubpath(pathToShow, [...context.node.path, p])));
        },
        query: searchString => {
            if (!rootNode) {
                throw "Root node not initialized";
            }

            // collapse root node
            rootNode.toggleExpand(false);

            let resultPromise = searchInternal(data, rootNode.path, searchString, options)
                .then(paths => {
                    // set the collection off paths to show
                    pathsToShow = paths;
                    // trigger expand
                    pathsToShow.length && rootNode?.toggleExpand(true);
                    // disable property filtering
                    pathsToShow = null;
                    return paths;
                });

            resultPromise.catch(() => {
                pathsToShow = null;
            });

            return resultPromise;
        }
    }
}


function searchInternal(data: any, root: string[], query: string, options?: SonjReview.ISearchOptions): Promise<string[][]> {
    const isMatching = getMatcher(query, !!options?.caseSensitive);
    return new Promise((resolve, reject) => {
        const result = getValueLocations(data, root, isMatching, options);
        resolve(result);
    })
}

/**
 * Search function which walks through given object and finds locations of the nodes containing query string
 * @param data Data object to be searched
 * @param path Current path
 * @param isMatching Query matcher
 */
function getValueLocations(data: any, path: string[], isMatching: IMatcher, options?: SonjReview.ISearchOptions): string[][] {
    let results = [] as string[][];

    switch (typeof data) {
        case "object":
            if (data == null) {
                return results;
            }

            Object.keys(data).forEach(k => {

                const propPath = [...path, k];

                if (isMatching(k)) {
                    results.push(propPath);
                }
                else {
                    results = results.concat(getValueLocations(data[k], propPath, isMatching, options));
                }
            });

            break;

        case "number":
            data = (<number>data).toString();
        case "string":
            if (isMatching(<string>data)) {
                results.push(path);
            }

            break;
    }

    return results;
}

/**
 * Returns case-sensitive or case-insensitive matcher
 */
const getMatcher = ((query: string, caseSensitiveSearch: boolean) => {
    let pattern: RegExp;
    return (dataString: string): boolean => {
        if (caseSensitiveSearch) {
            return dataString.includes(query);
        }

        if (!pattern) {
            pattern = new RegExp(escapeRegExp(query), "i");
        }

        return pattern.test(dataString);
    };
});

/**
 * Escapes regex special chars
 * @param text Text to process
 * @returns Safe regex query
 */
function escapeRegExp(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Checks whether given subpath is part of the full path
 * @param basePath Full path
 * @param subpathToCheck Subpath to check
 * @returns True when given subpath is part of the full path
 */
const isSubpath = (basePath: string[], subpathToCheck: string[]) => {
    if (subpathToCheck.length > basePath.length) {
        return false;
    }

    return subpathToCheck.every((val, i) => val == basePath[i]);
}

interface IMatcher {
    (dataString: string): boolean
}