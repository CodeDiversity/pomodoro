import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { saveSession, deleteSession } from '../../services/sessionStore'
import { formatDateFull } from '../../utils/dateUtils'
import { formatDurationFull } from '../../utils/durationUtils'
import { colors, transitions } from '../ui/theme'
import RichTextDisplay from '../RichTextDisplay'

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.25s ease;
  z-index: 999;
`

const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.25s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
`

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: ${colors.text};
  font-weight: 600;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.textMuted};
  padding: 0;
  line-height: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.fast};

  &:hover {
    background-color: ${colors.surface};
    color: ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`

const DetailRow = styled.div`
  margin-bottom: 16px;
`

const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: ${colors.textMuted};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`

const DetailValue = styled.div`
  font-size: 0.95rem;
  color: ${colors.text};
`

const NoteTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  transition: all ${transitions.fast};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }
`

const TagsInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: all ${transitions.fast};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }
`

const TagsDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #F0F7FF;
  border: 1px solid ${colors.primary};
  border-radius: 16px;
  font-size: 0.85rem;
  color: ${colors.primary};
`

const ModeBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: #F0F7FF;
  border: 1px solid ${colors.primary};
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const DeleteButton = styled.button`
  margin: 20px;
  padding: 12px;
  border: 1px solid ${colors.error};
  border-radius: 8px;
  background: #fff;
  color: ${colors.error};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    background: #fff5f5;
  }

  &:focus-visible {
    outline: 2px solid ${colors.error};
    outline-offset: 2px;
  }
`

const SaveStatus = styled.div<{ $saving: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$saving ? colors.textMuted : colors.success};
  margin-top: 6px;
`

const ConfirmDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  max-width: 320px;
  text-align: center;
`

const ConfirmTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 1.1rem;
  color: ${colors.text};
  font-weight: 600;
`

const ConfirmText = styled.p`
  margin: 0 0 20px;
  color: ${colors.textMuted};
  font-size: 0.95rem;
`

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

const ConfirmButton = styled.button<{ $danger?: boolean }>`
  padding: 10px 20px;
  border: 1px solid ${props => props.$danger ? colors.error : colors.border};
  border-radius: 8px;
  background: ${props => props.$danger ? colors.error : '#fff'};
  color: ${props => props.$danger ? '#fff' : colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    background: ${props => props.$danger ? '#c0392b' : colors.surface};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.$danger ? colors.error : colors.primary};
    outline-offset: 2px;
  }
`

interface HistoryDrawerProps {
  session: SessionRecord | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  onSave?: () => void
}

export function HistoryDrawer({ session, isOpen, onClose, onDelete, onSave }: HistoryDrawerProps) {
  const [noteText, setNoteText] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(true)

  // Reset local state when session changes
  useEffect(() => {
    if (session) {
      setNoteText(session.noteText || '')
      setTagsInput(session.tags.join(', '))
    }
  }, [session])

  // Debounced auto-save (500ms)
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>
      return (newNote: string, newTags: string[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (!session) return
          setIsSaving(true)
          try {
            const updatedSession: SessionRecord = {
              ...session,
              noteText: newNote,
              tags: newTags,
            }
            await saveSession(updatedSession)
            onSave?.()
          } catch (error) {
            console.error('Failed to save session:', error)
          } finally {
            setIsSaving(false)
          }
        }, 500)
      }
    })(),
    [session]
  )

  // Handle note changes
  const handleNoteChange = (value: string) => {
    setNoteText(value)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t)
    debouncedSave(value, tags)
  }

  // Handle tags changes
  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value.split(',').map(t => t.trim()).filter(t => t)
    debouncedSave(noteText, tags)
  }

  const handleDeleteClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!session) return
    try {
      await deleteSession(session.id)
      setShowConfirm(false)
      onDelete()
      onClose()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirm(false)
  }

  const handleOverlayClick = () => {
    onClose()
  }

  const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t)

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={handleOverlayClick} />
      <DrawerContainer $isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>Session Details</DrawerTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </DrawerHeader>
        <DrawerContent>
          <DetailRow>
            <DetailLabel>Start Time</DetailLabel>
            <DetailValue>{session ? formatDateFull(session.startTimestamp) : ''}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>End Time</DetailLabel>
            <DetailValue>{session ? formatDateFull(session.endTimestamp) : ''}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>{session ? formatDurationFull(session.actualDurationSeconds) : ''}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Mode</DetailLabel>
            <ModeBadge>{session?.mode || 'focus'}</ModeBadge>
          </DetailRow>
          <DetailRow>
            <DetailLabel style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Note
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}
              >
                {isEditingNotes ? 'View' : 'Edit'}
              </button>
            </DetailLabel>
            {isEditingNotes ? (
              <>
                <NoteTextArea
                  value={noteText}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Add a note..."
                />
                <SaveStatus $saving={isSaving}>
                  {isSaving ? 'Saving...' : 'Saved'}
                </SaveStatus>
              </>
            ) : (
              <RichTextDisplay content={noteText || ''} />
            )}
          </DetailRow>
          <DetailRow>
            <DetailLabel>Tags (comma separated)</DetailLabel>
            <TagsInput
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="work, project-name, ..."
            />
            {tagsArray.length > 0 && (
              <TagsDisplay>
                {tagsArray.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </TagsDisplay>
            )}
          </DetailRow>
        </DrawerContent>
        <DeleteButton onClick={handleDeleteClick}>
          Delete Session
        </DeleteButton>
      </DrawerContainer>

      {showConfirm && (
        <ConfirmDialog>
          <ConfirmTitle>Delete Session?</ConfirmTitle>
          <ConfirmText>This action cannot be undone.</ConfirmText>
          <ConfirmButtons>
            <ConfirmButton onClick={handleCancelDelete}>Cancel</ConfirmButton>
            <ConfirmButton $danger onClick={handleConfirmDelete}>Delete</ConfirmButton>
          </ConfirmButtons>
        </ConfirmDialog>
      )}
    </>
  )
}
