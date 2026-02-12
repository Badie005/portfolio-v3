import { memo, useMemo } from 'react';
import { AlertCircle, Zap } from 'lucide-react';
import { ChatMessage } from '../ChatReducer';
import MessageContent from './MessageContent';
import FileChangeCard from './FileChangeCard';
import ActionLine from './ActionLine';
import AgentActionLine from './AgentActionLine';
import { useTranslations } from 'next-intl';

interface ChatMessageListProps {
    messages: ChatMessage[];
    streamingText: string;
    status: 'idle' | 'loading' | 'streaming' | 'error';
    thinkingTime: number;
    thinkingMessage: string;
    activeFile?: { name: string } | null;
    onApplyCodeChange: (messageId: string, changeIndex: number) => void;
    onOpenFile: (filename: string) => void;
}

const ChatMessageList = memo<ChatMessageListProps>(({
    messages,
    streamingText,
    status,
    thinkingTime,
    thinkingMessage,
    activeFile,
    onApplyCodeChange,
    onOpenFile
}) => {
    const t = useTranslations('ide');

    const messageList = useMemo(() => (
        messages.map((msg) => (
            <div key={msg.id} className="w-full animate-chat-fade-in-up">
                {msg.role === 'user' && (
                    <div className="mb-3">
                        <div className="bg-[#F5F3EE] border border-[#E8E5DE] rounded-lg px-4 py-3">
                            <p className="text-[13px] text-[#37352F] leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                )}

                {msg.role === 'model' && (
                    <div className="w-full py-2">
                        {msg.error && (
                            <div className="px-1 py-2">
                                <div className="flex items-start gap-2 bg-[#FAF9F6] border-l-2 border-[#D97757] p-2 rounded-r">
                                    <AlertCircle size={14} className="text-[#D97757] mt-0.5" />
                                    <span className="text-[12px] text-[#6B6B6B] leading-relaxed">{msg.error}</span>
                                </div>
                            </div>
                        )}

                        {msg.thoughts && !msg.error && (
                            <div className="mb-1">
                                <ActionLine type="thought" text={msg.thoughts} time={msg.thinkingTime ? `${msg.thinkingTime}s` : undefined} />
                            </div>
                        )}

                        {msg.actions && msg.actions.length > 0 && (
                            <div className="mb-2 space-y-0.5">
                                {msg.actions.map((action, idx) => (
                                    <AgentActionLine key={idx} action={action} />
                                ))}
                            </div>
                        )}

                        {msg.text && !msg.error && (
                            <div className="px-1 py-1">
                                <MessageContent
                                    text={msg.text}
                                    isStreaming={msg.isStreaming}
                                    showInlineCode={!msg.codeChanges || msg.codeChanges.length === 0}
                                />
                            </div>
                        )}

                        {msg.cached && (
                            <div className="px-1 mt-2 text-[10px] text-ide-muted flex items-center gap-1">
                                <Zap size={10} />
                                {t('chat.cached')}
                            </div>
                        )}

                        {msg.codeChanges && msg.codeChanges.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {msg.codeChanges.map((change, idx) => (
                                    <FileChangeCard
                                        key={idx}
                                        change={change}
                                        onApply={() => onApplyCodeChange(msg.id, idx)}
                                        onClick={() => onOpenFile(change.filename)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        ))
    ), [messages, onApplyCodeChange, onOpenFile, t]);

    return (
        <>
            {messageList}

            {streamingText && (
                <div className="w-full py-2">
                    <div className="px-1 py-1">
                        <MessageContent text={streamingText} isStreaming />
                    </div>
                </div>
            )}

            {status === 'loading' && !streamingText && (
                <div className="w-full py-1">
                    <ActionLine type="thought" text={thinkingMessage} time={`${thinkingTime}s`} loading />
                    {activeFile && <ActionLine type="read" text={activeFile.name} />}
                </div>
            )}
        </>
    );
});

ChatMessageList.displayName = 'ChatMessageList';
export default ChatMessageList;
