# Backend memory-efficiency evidence, 2026-09-22

The API was measured locally with Node 24.18.1 against MongoDB 8.0.32 using the compiled production entrypoint. The same workload performed 25 authenticated writes plus 200 concurrent bounded visibility/readiness requests, all returning HTTP 200.

| Runtime | Idle RSS | RSS after workload | Median | p95 | Peak |
| --- | ---: | ---: | ---: | ---: | ---: |
| Previous Mongoose implementation | 99,008 KiB | 123,488 KiB | 5.71 ms | 10.36 ms | 12.60 ms |
| Direct MongoDB driver | 88,960 KiB | 98,240 KiB | 2.33 ms | 4.26 ms | 4.95 ms |
| Direct driver, 64 MiB old-space ceiling | 88,864 KiB | 97,872 KiB | 1.75 ms | 5.04 ms | 5.39 ms |

Five additional workloads, totaling another 125 writes and 1,000 requests, ended at 104,256 KiB RSS with the 64 MiB old-space ceiling. This supports `MemoryHigh=128M` and `MemoryMax=160M`, leaving measured operating headroom while bounding contribution to host memory pressure.

The implementation also limits the MongoDB pool to three connections, retires idle connections after 30 seconds, coalesces readiness probes, admits at most four public database operations and one administrative operation, and rejects excess work without an in-process queue.

These are local source/artifact measurements, not production telemetry. Re-check systemd memory events after activation before lowering either host limit.
