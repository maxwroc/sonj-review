import { IPlugin } from "../plugins";

export const propertyGroups = (): IPlugin => {
    return {
        beforeRenderProperties: (node, properties) => {
            return properties;
        }
    }
}