import { bisector } from 'd3-array';
import { GraphDatapoint } from '../models';

export const getDate = (d: GraphDatapoint) => d.timestamp;
export const getValue = (d: GraphDatapoint) => d.value;
export const bisectDate = bisector(getDate).left;