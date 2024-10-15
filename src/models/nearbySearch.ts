export interface IPlaceItem {
  id: string;
  regularOpeningHours: {
    openNow: boolean;
    periods: [
      {
        open: {
          day: number;
          hour: number;
          minute: number;
        };
        close: {
          day: number;
          hour: number;
          minute: number;
        };
      }
    ];
    weekdayDescriptions: string[];
  };
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
