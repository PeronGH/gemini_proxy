export function removePrefix(str: string, prefix: string) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

export function mapRole(role: string) {
  switch (role) {
    case "assistant":
      return "model";
    default:
      return role;
  }
}
