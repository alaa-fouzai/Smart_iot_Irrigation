export class User {
  public id: string;
  public FirstName: string;
  public LastName: string;
  public email: string;
  public createdate: Date;
  public locationIds: [];
  public Notifications: {
    Push: boolean;
    Email: boolean;
    SMS: boolean;
    };
  toString() {
    return 'id :' + this.id + ' LastName:' + this.LastName + ' FirstName:'
      + this.FirstName + ' email:' + this.email + ' created date :' + this.createdate + ' LocationIds : ' + this.locationIds
      + ' notification :' + this.Notifications;
  }
}
