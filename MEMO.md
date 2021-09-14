# Memo

## Stream type

| type                                            | isLive (auto) | auto                     | direct (isLive: true)  | direct (isLive: false) |
| ----------------------------------------------- | ------------- | ------------------------ | ---------------------- | ---------------------- |
| live/pre stream                                 | `true`        | **OK**                   | **OK**                 | `DisabledChatError`    |
| pre stream but chat disabled                    | `true`        | `DisabledChatError`      | `DisabledChatError`    | `DisabledChatError`    |
| archived stream                                 | `false`       | **OK**                   | `DisabledChatError`    | **OK**                 |
| archived stream but replay chat being processed | `false`       | `DisabledChatError`      | `DisabledChatError`    | `DisabledChatError`    |
| members-only live stream                        | N/A           | `MembersOnlyError`       | `DisabledChatError`    | `MembersOnlyError`     |
| members-only archived stream                    | N/A           | `MembersOnlyError`       | `DisabledChatError`    | **OK**                 |
| unarchived stream                               | N/A           | `NoStreamRecordingError` | `DisabledChatError`    | `DisabledChatError`    |
| privated stream                                 | N/A           | `NoPermissionError`      | `NoPermissionError`    | `NoPermissionError`    |
| deleted stream                                  | N/A           | `UnavailableError`       | `UnavailableError`     | `UnavailableError`     |
| invalid video/channel id                        | N/A           | `UnavailableError`       | `InvalidArgumentError` | `InvalidArgumentError` |
