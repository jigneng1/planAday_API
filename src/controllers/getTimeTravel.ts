import axios from "axios";

const getTimeTravelByPlaceId = async (origin: string, destination: string) => {
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";
  const modes = ["driving", "walking"];
  const results: { [key: string]: string | null } = {};
  for (const mode of modes) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:${origin}&destinations=place_id:${destination}&mode=${mode}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.rows[0].elements[0].status === "OK") {
        const travelTime = data.rows[0].elements[0].duration.text;
        console.log(
          `Travel time (${mode}) from ${origin} to ${destination}: ${travelTime}`
        );
        results[mode] = travelTime;
      } else {
        throw new Error(
          `Error fetching ${mode} travel time: ${data.rows[0].elements[0].status}`
        );
      }
    } catch (error) {
      console.error(`Error fetching ${mode} travel time:`, error);
      results[mode] = null;
    }
  }

  return results;
};

export default getTimeTravelByPlaceId;
