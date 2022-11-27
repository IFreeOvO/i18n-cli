import { useIntl } from 'umi';
export function t(key: string, params: Record<string, string> = {}) {
  const intl = useIntl();
  return intl.formatMessage(
    {
      id: key,
    },
    params,
  );
}
