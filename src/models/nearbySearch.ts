export interface IPlaceItem {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  primaryType: string;
  shortFormattedAddress: string;
  primaryTypeDisplayName: {
    text: string;
  };
  photos: [
    {
      name: string;
      height: number;
      width: number;
    }
  ];
}
