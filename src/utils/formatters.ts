export const formatDate = (date: Date): string =>
  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

export const formatCount = (value: number): string => {
  if (value < 1000) {
    return `${value}`;
  } else if (value < 1000000) {
    return `${(value/1000).toFixed(2)}k`;
  } else {
    return `${(value/1000000).toFixed(2)}mill`;
  }
}

export const toOrdinal = (number: number) => {
  switch (number) {
    case 1: return '1st';
    case 2: return '2nd';
    case 3: return '3rd';
    default: return `${number}th`;
  }
}
