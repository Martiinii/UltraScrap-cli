declare module 'html-table-to-json' {
    type ParseResult<T extends ReadOnlyArray<string>, V = string> = {
        results: { [K in (T extends ReadonlyArray<infer U> ? U : never)]: V }[][]
        count: number,
    };

    export function parse<T extends ReadonlyArray<string>>(html: string): ParseResult<T>
}