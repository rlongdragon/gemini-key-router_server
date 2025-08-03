import { Request, Response } from 'express';
import { keyStatusService } from '../../services/KeyStatusService';

export class SseController {
  public static streamStatus(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const eventHandler = (data: { keyId: string; status: string }) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    keyStatusService.on('key_status_update', eventHandler);

    req.on('close', () => {
      keyStatusService.off('key_status_update', eventHandler);
    });
  }
}