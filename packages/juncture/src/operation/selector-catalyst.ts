/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable, Subscriber } from 'rxjs';
import { PersistentPath } from './path';

interface SelectorCatalystSetup {
  readonly valueUsageMonitor: {
    start(): void;
    stop(): PersistentPath[];
  };
  readonly persistentPathManager: {
    registerRequirement(path: PersistentPath): void;
    releaseRequirement(path: PersistentPath): void;
  };
}

interface Audit {
  readonly paths: Set<PersistentPath>;
  subscribers: Subscriber<any>[];
}

export class SelectorCatalyst {
  constructor(protected setup: SelectorCatalystSetup) { }

  protected audits = new Set<Audit>();

  protected createObservable(paths: PersistentPath[]): Observable<void> {
    let audit: Audit | undefined;

    return new Observable(sub => {
      if (!audit) {
        audit = {
          paths: new Set(paths),
          subscribers: [sub]
        };
        this.audits.add(audit);
      } else {
        audit.subscribers.push(sub);
      }

      paths.forEach(path => {
        this.setup.persistentPathManager.registerRequirement(path);
      });

      return () => {
        if (audit!.subscribers.length === 1) {
          this.audits.delete(audit!);
          audit = undefined;
        } else {
          audit!.subscribers = audit!.subscribers.filter(subscriber => subscriber !== sub);
        }

        paths.forEach(path => {
          this.setup.persistentPathManager.releaseRequirement(path);
        });
      };
    });
  }

  startAudit(): () => Observable<void> {
    this.setup.valueUsageMonitor.start();
    return () => {
      const paths = this.setup.valueUsageMonitor.stop();
      return this.createObservable(paths);
    };
  }

  // onValueChange(path: PersistentPath): void { }
}
