export interface FiveMErrorOptions {
	method: string;
	url?: string;
	status?: number;
	cause?: unknown;
}

export class FiveMError extends Error {
	public readonly method: string;
	public readonly url?: string;
	public readonly status?: number;
	public readonly cause?: unknown;

	constructor(message: string, options: FiveMErrorOptions) {
		super(message);
		this.name = "FiveMError";
		this.method = options.method;
		this.url = options.url;
		this.status = options.status;
		this.cause = options.cause;
	}

	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			method: this.method,
			url: this.url,
			status: this.status,
		};
	}
}
