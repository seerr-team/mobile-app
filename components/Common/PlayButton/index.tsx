import ButtonWithDropdown from '@/components/Common/ButtonWithDropdown';
import ThemedText from '@/components/Common/ThemedText';
import { Linking } from 'react-native';

interface PlayButtonProps {
  links: PlayButtonLink[];
}

export interface PlayButtonLink {
  text: string;
  url: string;
  svg: React.ReactNode;
}

const PlayButton = ({ links }: PlayButtonProps) => {
  if (!links || !links.length) {
    return null;
  }

  return (
    <ButtonWithDropdown
      as="link"
      buttonType="ghost"
      text={
        <>
          {links[0].svg}
          <ThemedText>{links[0].text}</ThemedText>
        </>
      }
      href={links[0].url}
      target="_blank"
      popoverStyle={{ marginTop: 112, marginLeft: 32 }}
    >
      {links.length > 1 &&
        links.slice(1).map((link, i) => {
          return (
            <ButtonWithDropdown.Item
              key={`play-button-dropdown-item-${i}`}
              buttonType="ghost"
              onPress={() => {
                Linking.openURL(link.url);
              }}
            >
              {link.svg}
              <ThemedText>{link.text}</ThemedText>
            </ButtonWithDropdown.Item>
          );
        })}
    </ButtonWithDropdown>
  );
};

export default PlayButton;
