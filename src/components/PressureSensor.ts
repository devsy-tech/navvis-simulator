import {MqttClient} from "mqtt";
import {Sensor, SensorDataType, SensorDatum} from "./Sensor";

/**
 * The class that simulates pressure sensors.
 */
export class PressureSensor extends Sensor
{
	private value: SensorDataType = 3;

	constructor(id: number, client: MqttClient)
	{
		super(id, "pressure", client);
	}

	/**
	 * Simulates pseudo-realistic pressure data.
	 * @returns {SensorDatum} Sensor data that is simulated
	 */
	protected simulate(): SensorDatum
	{
		const prob = Math.random();
		const stepSize = Math.random() * 0.5;

		// Positive for 70% probability, negative for 30% probability
		const stepSign = (prob < 0.7) ? 1 : -1;

		// Spike temperature with 5% chance
		if (prob < 0.05)
		{
			this.value = 5;
		}
		// Spike temperature with 5% chance
		else if (prob > 0.95)
		{
			this.value = 1.5;
		}
		else
		{
			// if temperature is less than 10, increase it
			if (this.value <= 1.2)
			{
				this.value += 1;
			}
			// if temperature is between 10 and 55, increase it with 70% chance and decrease with 30% chance
			else if (this.value < 4)
			{
				this.value += stepSign * stepSize;
			}
			// if temperature is between 55 and 90, increase it with 30% chance and decrease with 70% chance
			else if (this.value < 7)
			{
				this.value -= stepSign * stepSize;
			}
			// if temperature is more than 90, decrease it
			else
			{
				this.value -= 1;
			}
		}
		this.value = parseFloat(this.value.toFixed(2));

		const data: SensorDatum = {
			id: this.id,
			value: this.value,
			timestamp: new Date().toJSON()
		};

		this.historicalData.push(data);
		return data;
	}
}

