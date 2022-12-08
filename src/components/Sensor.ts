import {MqttClient} from "mqtt";
import {LimitedLengthArray} from "./LimitedLengthArray";

export type SensorDataType = number;

export interface SensorDatum 
{
	id: number;
	value: SensorDataType;
	timestamp: string;
}

/**
 * The abstract class that represents sensors.
 */
export abstract class Sensor
{
	private readonly HISTORICAL_DATA_SIZE = 30;

	public historicalData = new LimitedLengthArray<SensorDatum>(this.HISTORICAL_DATA_SIZE);

	protected constructor(
		protected readonly id: number,
		private readonly topic: string,
		private readonly client: MqttClient
	)
	{}

	public start(): void
	{
		// Generate data every 2 seconds.
		setInterval(() =>
		{
			const data = this.simulate();
			console.log(JSON.stringify(data));
			this.client.publish(`iot/${this.topic}/${this.id}`, JSON.stringify(data),
				{qos: 0, retain: false});
		}, 2000);
	}

	/**
	 * Simulates pseudo-realistic sensor data.
	 * @returns {SensorDatum} Sensor data that is simulated
	 */
	protected abstract simulate(): SensorDatum;
}

