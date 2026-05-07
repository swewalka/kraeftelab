export type UnitSystem = "si";

const formatNumber = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : undefined,
  }).format(value);

export const formatMeters = (meters: number): string => `${formatNumber(meters)} m`;

export const formatNewtonsAsKilonewtons = (newtons: number): string =>
  `${formatNumber(newtons / 1000)} kN`;

export const formatMoment = (newtonMeters: number): string =>
  `${formatNumber(newtonMeters / 1000)} kN m`;
