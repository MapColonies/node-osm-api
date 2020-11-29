/* eslint-disable @typescript-eslint/naming-convention */
import xml from 'xml';

export function createChangesetXml(generator: string, createdBy: string): string {
    const data = [{ 
        osm: [
            { changeset: [
                { _atter: {version: 0.6, generator: generator}},
                { tag: {_attr: {k: "created_by", v: createdBy}}}
            ]}]
        }];
    return createtXml(data);
}

function createtXml(file: any): string {
    const osmXml = xml(file);
    return osmXml;
}