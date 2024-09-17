import axios from "axios";

const getPhotoFromGoogle = async (photoName: string) => {
  const apiKey = "AIzaSyBKTx5neg3VzAsPMzpEDffGwXROdayD28M";

  // Construct the Google Maps Places API URL
  const photoURL = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxWidthPx=500&skipHttpRedirect=true`;

  const response = await axios.get(photoURL);

  return response.data.photoUri;
};

export default getPhotoFromGoogle;
