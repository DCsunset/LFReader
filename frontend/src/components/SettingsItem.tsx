import { Stack, ListItemText } from "@mui/material";

export default function SettingsItem({ title, subtitle, children }: {
  title: string,
  subtitle?: any,
  children: any
}) {
  return (
    <Stack direction="row" className="w-full items-center">
      <ListItemText secondary={subtitle && <span>{subtitle}</span>}>
        {title}
      </ListItemText>
      <span className="grow min-w-2" />
      <span className="text-right">{children}</span>
    </Stack>
  );
}

