import { Request, Response } from 'express';
import { statsService } from '../services/stats.service';

const clients: Response[] = [];

export const broadcastSseEvent = (eventName: string, data: unknown) => {
  clients.forEach((client) => {
    client.write(`event: ${eventName}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

export class SseController {
  public static streamStatus(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    const sendEvent = (eventName: string, data: unknown) => {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const newUsageHandler = (data: unknown) => {
      sendEvent('new_usage', data);
    };

    statsService.on('new_usage', newUsageHandler);

    req.on('close', () => {
      clients.splice(clients.indexOf(res), 1);
      statsService.off('new_usage', newUsageHandler);
    });
  }
}