'use client';

import { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { useMemberSearch } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import type { MemberSearchResult } from '@/services/workspace/workspace.types';

interface MentionTextareaProps {
  workspaceId: string;
  value: string;
  onChange: (value: string) => void;
  onSubmitShortcut?: () => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}

// Metinde caret'in hemen öncesinde aktif bir "@sorgu" var mı diye bakar.
// - "@" bulunamazsa ya da "@"den önceki karakter boşluk/satır başı değilse
//   (örn. bir e-posta adresinin ortasındaki @) mention tetiklenmez.
// - "@" ile caret arasında boşluk varsa (kelime bitmiş demektir) tetiklenmez.
function detectMention(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const atIndex = before.lastIndexOf('@');
  if (atIndex === -1) return null;

  const charBeforeAt = before[atIndex - 1];
  if (charBeforeAt !== undefined && !/\s/.test(charBeforeAt)) return null;

  const query = before.slice(atIndex + 1);
  if (/\s/.test(query)) return null;

  return { start: atIndex, query };
}

export function MentionTextarea({
  workspaceId,
  value,
  onChange,
  onSubmitShortcut,
  placeholder,
  rows,
  className,
  autoFocus,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: members, isFetching } = useMemberSearch(workspaceId, debouncedQuery);
  const isOpen = mentionQuery !== null;

  const scheduleSearch = (query: string | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query === null) {
      setDebouncedQuery(null);
      return;
    }
    // task search ile aynı 300ms debounce (bkz. task-search-dialog.tsx)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
  };

  const closeMention = () => {
    setMentionStart(null);
    setMentionQuery(null);
    scheduleSearch(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const caret = e.target.selectionStart ?? text.length;
    const mention = detectMention(text, caret);

    if (mention) {
      setMentionStart(mention.start);
      setMentionQuery(mention.query);
      setActiveIndex(0);
      scheduleSearch(mention.query);
    } else if (isOpen) {
      closeMention();
    }
  };

  // Fare tıklaması ya da ok tuşlarıyla caret, mention bölgesinin dışına
  // çıkarsa (metin değişmeden) popover'ı kapat
  const handleSelect = () => {
    const el = textareaRef.current;
    if (!el || !isOpen) return;
    const mention = detectMention(el.value, el.selectionStart ?? 0);
    if (!mention) closeMention();
  };

  const selectMember = (member: MemberSearchResult) => {
    if (mentionStart === null) return;
    const caret = textareaRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(caret);
    const inserted = `@[${member.name}](${member.id}) `;
    const newValue = before + inserted + after;

    onChange(newValue);
    closeMention();

    requestAnimationFrame(() => {
      const pos = before.length + inserted.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isOpen) {
      // Liste boş olsa bile (henüz yükleniyor ya da sonuç yok) Escape her
      // zaman çalışmalı, kullanıcı mention modundan çıkabilsin
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMention();
        return;
      }

      if (members && members.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % members.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((i) => (i - 1 + members.length) % members.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          selectMember(members[activeIndex]);
          return;
        }
      }
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmitShortcut?.();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && closeMention()}>
      <PopoverAnchor asChild>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          placeholder={placeholder}
          rows={rows}
          className={className}
          autoFocus={autoFocus}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-64 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {isFetching && !members?.length ? (
          <p className="text-xs text-muted-foreground text-center py-3">Aranıyor...</p>
        ) : !members?.length ? (
          <p className="text-xs text-muted-foreground text-center py-3">Üye bulunamadı</p>
        ) : (
          members.map((member, i) => (
            <button
              key={member.id}
              type="button"
              onClick={() => selectMember(member)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
                i === activeIndex ? 'bg-muted' : 'hover:bg-muted',
              )}
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                {member.name.charAt(0)}
              </div>
              <span className="truncate">{member.name}</span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}