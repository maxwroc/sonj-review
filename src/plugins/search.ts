import { JsonViewer } from "../index";
import { IPlugin } from "../plugins";

export const search = (data: any): IQueryPlugin => {

    let rootNode: JsonViewer | null = null;

    let pathsToShow: string[] | null = null;

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
                .filter(p => pathsToShow?.some(path => path.startsWith(context.node.path + "/" + p)));;
        },
        query: searchString => {
            if (!rootNode) {
                throw "Root node not initialized";
            }

            // collapse root node
            rootNode.toggleExpand(false);

            let resultPromise = searchInternal(data, rootNode.path, searchString)
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

interface IQueryPlugin extends IPlugin {
    query: (searchString: string) => Promise<string[]>;
}

function searchInternal(data: any, root: string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const result = getValueLocations(data, root, query);
        resolve(result);
    })
}

/**
 * Search function which walks through given object and finds locations of the nodes containing query string
 * @param data Data object to be searched
 * @param path Current path
 * @param query Searched query
 */
function getValueLocations(data: any, path: string, query: string): string[] {
    let results = [] as string[];

    switch (typeof data) {
        case "object":
            if (data == null) {
                return results;
            }

            Object.keys(data).forEach(k => {

                const propPath = `${path}/${k}`;

                if (k.includes(query)) {
                    results.push(propPath);
                }
                else {
                    results = results.concat(getValueLocations(data[k], `${path}/${k}`, query));
                }
            });

            break;

        case "number":
            data = (<number>data).toString();
        case "string":
            if ((<string>data).includes(query)) {
                results.push(path);
            }

            break;
    }

    return results;
}