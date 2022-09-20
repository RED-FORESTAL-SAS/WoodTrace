export interface License{
    id?: string;
    userId?: string | null;
    dateInit?: string | null;
    dateEnd?: string;
    months?: number;
    remainingDays?: number;
}