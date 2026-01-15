import { useAccount, useSwitchChain } from '@/lib/web3'
import { STORY_CHAIN_ID, STORY_CHAIN_NAME } from '@/constants/protocols/story'

export function useStoryChain() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  const isOnStoryChain = chain?.id === STORY_CHAIN_ID
  const needsSwitch = isConnected && !isOnStoryChain

  const switchToStory = () => {
    if (switchChain) {
      switchChain(STORY_CHAIN_ID)
    }
  }

  return {
    isOnStoryChain,
    needsSwitch,
    switchToStory,
    chainId: chain?.id,
    storyChainId: STORY_CHAIN_ID,
    storyChainName: STORY_CHAIN_NAME,
  }
}
