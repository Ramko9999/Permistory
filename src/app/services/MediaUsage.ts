import { Device } from "../components/home/Home";
import { Permission } from "../../shared/interface";
import { queryMediaSessions } from "../../shared/store";
import mockData from "../utils/mock";
/* global chrome */

export async function getAudioUsage(fromDate: Date, toDate: Date){
    const mediaSessions = await queryMediaSessions(fromDate.valueOf(), toDate.valueOf());
    return mediaSessions.filter(({permission}) => Permission.AUDIO === permission);
}