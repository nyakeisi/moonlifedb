'use strict'

export class Snowflake {

	protected worker: number;
	protected epoch: number;
	protected seq: number;
	protected lastTime: number | bigint;

	/**
	 * Class constructor of an ID generator, based on Twitter Snowflake.
	 * @example const Generator = new Snowflake({ worker: 0, epoch: 1640995200000 })
	 * @param {(number|undefined)} worker worker ID in number or bigint (Converts to bigint). By default it's 0
	 * @param {(number|undefined)} epoch epoch ofset where to start generating. Requires milliseconds.
	 */

	constructor (
		settings: {
			worker: number | undefined, 
			epoch: number | undefined
		}
    ) {
		this.worker = settings.worker != undefined ? settings.worker : 0; // starts from 0
		this.epoch = settings.epoch != undefined ? settings.epoch : 0;
		this.seq = 0;
		this.lastTime = 0;
		if (this.worker < 0) {
			const integerError = "worker must be greater or equal to 0.";
			throw new Error(integerError);
		}
		if (this.epoch < 0) {
			const epochError = "epoch must be greater or equal to 0.";
			throw new Error(epochError);
		}
	}

	/**
	 * Generate a 63 bits long unique ID.
	 * @example const ID = FlakeID.generate();
	 * @returns {snowflake} snowflake
	 */

	public generate (
	): string
	{
		var time = Number(Date.now()),
			   t = (time - this.epoch).toString(2);
		if (this.lastTime == time) {
			this.seq++;
			if (this.seq > 4095) {
				this.seq = 0;
				while (Date.now() <= time) {}
			}
		} else this.seq = 0;
		this.lastTime = time;

		let s = this.seq.toString(2),
			w = this.worker.toString(2);
		while (t.length < 41) t = "0" + t;
		while (w.length < 12) w = "0" + w;
		while (s.length < 10) s = "0" + s; 

		const sid = t + w + s;
		let id = "";
		for (let i = sid.length; i > 0; i-= 4) id = parseInt(sid.substring(i - 4, i), 2).toString(16) + id;
		let res: bigint = BigInt("0x"+id);

		return String(res) as string;
	}

	/**
	 * Generate a 63 bits long unique ID.
	 * @example const ID = FlakeID.generate({ decode: true });
	 * @param settings
	 * @param decode returns object with raw binary data.
	 * @returns {object} snowflake
	 */

	public generateRaw (
	): object
	{
		var time = Number(Date.now()),
			   t = (time - this.epoch).toString(2);
		if (this.lastTime == time) {
			this.seq++;
			if (this.seq > 4095) {
				this.seq = 0;
				while (Date.now() <= time) {}
			}
		} else this.seq = 0;
		this.lastTime = time;

		let s = this.seq.toString(2),
			w = this.worker.toString(2);

		while (t.length < 41) t = "0" + t;
		while (w.length < 12) w = "0" + w;
		while (s.length < 10) s = "0" + s; 

		const sid = t + w + s;
		let id = "";
		for (let i = sid.length; i > 0; i-= 4) id = parseInt(sid.substring(i - 4, i), 2).toString(16) + id;
		let res: number | bigint = BigInt("0x"+id);
		
		var object = {};
			object['result'] = String(res);
			object['raw'] = {
				result: sid,

				epoch: parseInt(t, 2),
				epochBinary: t,

				sequence: parseInt(s, 2),
				sequenceBinary:  s,

				worker: parseInt(w, 2),
				workerBinary: w
			}
		return object as object;
	}
}