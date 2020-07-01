export class Sensor {
  public id: string;
  public Name: string;
  public SensorType: string;
  public Description: string;
  public SensorCoordinates: [];
  public createdate: Date;
  public data: [];
  public rule = [] as  any;
  public RelayIds: [];
}
/*{
    stat: boolean ,
    StartTime: number,
    Tmax: number,
    Tmin: number,
    Notifications: {},
    Realyids: []
  }*/
