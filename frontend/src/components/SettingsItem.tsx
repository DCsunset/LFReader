import { Stack, ListItemText } from "@mui/material";

export default function SettingsItem({ title, subtitle, children }: {
  title: string,
  subtitle?: any,
  children: any
}) {
  return (
    <Stack direction="row" className="w-full items-center">
      <ListItemText
        className="!min-w-21"
        secondary={subtitle && <span>{subtitle}</span>}
      >
        {title}
      </ListItemText>
      <span className="grow min-w-3" />
      <span className="text-right">{children}</span>
    </Stack>
  );
}

