declare class FieldUpdate {
    fieldPath: string;
    value: unknown;
}
export declare class SaveDraftDto {
    fieldPath?: string;
    value?: unknown;
    fields?: FieldUpdate[];
}
export {};
