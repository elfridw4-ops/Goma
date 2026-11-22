interface ServerlessRequest {
  method?: string;
}

interface ServerlessResponse {
  status: (statusCode: number) => ServerlessResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Méthode non autorisée.' });
    return;
  }

  res.status(200).json({ ok: true, service: 'goma-delano-collection' });
}
