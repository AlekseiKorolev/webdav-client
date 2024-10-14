import { prepareRequestOptions, request } from "../request.js";
import { handleResponseCode } from "../response.js";
import { encodePath } from "../tools/path.js";
import { joinURL } from "../tools/url.js";
import { WebDAVClientContext } from "../types.js";

export async function setProperties(
    context: WebDAVClientContext,
    filePath: string,
    props: Record<string, unknown>
): Promise<boolean> {
    if (typeof props !== "object") {
        return false;
    }

    const data = `
        <D:propertyupdate xmlns:D="DAV:">
            <D:set>
                <D:prop>
                    ${Object.keys(props)
                        .map(key => `<D:${key}>${JSON.stringify(props[key])}</D:${key}>`)
                        .join("")}
                </D:prop>
            </D:set>
        </D:propertyupdate>
        `;

    const headers = {
        "Content-Type": 'application/xml; charset="utf-8"',
        "Content-Length": `${data.length}`
    };
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filePath)),
            method: "PROPPATCH",
            headers,
            data
        },
        context,
        {}
    );

    const response = await request(requestOptions, context);

    try {
        handleResponseCode(context, response);
    } catch (err) {
        return false;
    }

    return true;
}
