export class Base64 {
  public static Encode(data: string): string {
    return btoa(data)
  }
  public static Decode(data: string): string {
    return atob(data)
  }
}
