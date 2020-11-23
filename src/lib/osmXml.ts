import xml from 'xml';

export function createChangesetXml(generator: string, createdBy: string, host: string): string {
    const data = [{ 
        osm: [
            { changeset: [
                {_attr: {version: 0.6, generator: generator}},
                { tag: {_attr: {k: "created_by", v: createdBy}}},
                { tag: {_attr: {k: "host", v: host}} },
            ]}]
        }];
    return createtXml(data);
}

function createtXml(file: any) {
    const osmXml = xml(file);
    return osmXml;
}